using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;

namespace EcoDeal.Api.Services
{
    public class StoreService : IStoreService
    {
        private readonly IStoreRepository _storeRepository;
        private readonly IUserRepository _userRepository;

        public StoreService(IStoreRepository storeRepository, IUserRepository userRepository)
        {
            _storeRepository = storeRepository;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<StoreDto>> GetAllStoresAsync()
        {
            var stores = await _storeRepository.GetAllAsync();
            return stores.Select(MapToDto);
        }

        public async Task<StoreDto?> GetStoreByIdAsync(int id)
        {
            var store = await _storeRepository.GetByIdAsync(id);
            return store != null ? MapToDto(store) : null;
        }

        public async Task<PagedResponse<StoreDto>> GetPagedStoresAsync(int pageNumber, int pageSize)
        {
            var (items, totalCount) = await _storeRepository.GetPagedAsync(pageNumber, pageSize);
            return new PagedResponse<StoreDto>
            {
                Items = items.Select(MapToDto),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<IEnumerable<StoreDto>> SearchStoresAsync(string name)
        {
            var stores = await _storeRepository.SearchByNameAsync(name);
            return stores.Select(MapToDto);
        }

        public async Task<IEnumerable<StoreDto>> GetStoresByApprovalStatusAsync(bool isApproved)
        {
            var stores = await _storeRepository.GetByApprovalStatusAsync(isApproved);
            return stores.Select(MapToDto);
        }

        public async Task<StoreDto> AddStoreAsync(CreateStoreRequest request, int userId)
        {
            var store = new Store
            {
                StoreName = request.StoreName,
                Address = request.Address,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                UserId = userId,
                IsApproved = false // Default to false
            };

            var createdStore = await _storeRepository.AddAsync(store);
            return MapToDto(createdStore);
        }

        public async Task UpdateStoreAsync(int id, UpdateStoreRequest request)
        {
            var store = await _storeRepository.GetByIdAsync(id);
            if (store == null) return;

            if (request.StoreName != null) store.StoreName = request.StoreName;
            if (request.Description != null) store.Description = request.Description;
            if (request.StoreEmail != null) store.StoreEmail = request.StoreEmail;
            if (request.StorePhone != null) store.StorePhone = request.StorePhone;
            if (request.ImageUrl != null) store.ImageUrl = request.ImageUrl;
            if (request.Address != null) store.Address = request.Address;
            if (request.Latitude != null) store.Latitude = request.Latitude;
            if (request.Longitude != null) store.Longitude = request.Longitude;
            if (request.IsApproved.HasValue) store.IsApproved = request.IsApproved.Value;

            await _storeRepository.UpdateAsync(store);
        }

        public async Task DeleteStoreAsync(int id)
        {
            await _storeRepository.DeleteAsync(id);
        }

        public async Task<StoreDto?> GetStoreByUserIdAsync(int userId)
        {
            var stores = await _storeRepository.GetAllAsync();
            var store = stores.FirstOrDefault(s => s.UserId == userId);
            return store != null ? MapToDto(store) : null;
        }

        public async Task<StoreDto> RegisterStoreAsync(StoreRegistrationDto dto, int userId)
        {
            // 1. Check if user already has a store
            var existingStore = await GetStoreByUserIdAsync(userId);
            if (existingStore != null)
                throw new Exception("You already have a registered store.");

            // 2. Create the store
            var store = new Store
            {
                StoreName = dto.StoreName,
                Description = dto.Description,
                StoreEmail = dto.StoreEmail,
                StorePhone = dto.StorePhone,
                Address = dto.StoreAddress,
                ImageUrl = dto.ImageUrl,
                UserId = userId,
                IsApproved = true // Automatically approve for now or set to false if admin review is needed
            };

            var createdStore = await _storeRepository.AddAsync(store);

            // 3. Update User Role
            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null && user.Role != "StoreOwner")
            {
                user.Role = "StoreOwner";
                await _userRepository.UpdateAsync(user);
            }

            return MapToDto(createdStore);
        }

        public async Task<IEnumerable<StoreNearbyDto>> GetNearbyStoresAsync(double lat, double lon, double radiusKm)
        {
            var allStores = await _storeRepository.GetAllAsync();
            var nearbyStores = new List<StoreNearbyDto>();

            foreach (var store in allStores)
            {
                if (!store.Latitude.HasValue || !store.Longitude.HasValue) continue;

                var distance = CalculateDistance(lat, lon, (double)store.Latitude.Value, (double)store.Longitude.Value);
                if (distance <= radiusKm)
                {
                    var dto = MapToNearbyDto(store, distance);
                    nearbyStores.Add(dto);
                }
            }

            return nearbyStores.OrderBy(s => s.Distance);
        }

        private StoreNearbyDto MapToNearbyDto(Store store, double distance)
        {
            var baseDto = MapToDto(store);
            return new StoreNearbyDto
            {
                StoreId = baseDto.StoreId,
                UserId = baseDto.UserId,
                StoreName = baseDto.StoreName,
                Description = baseDto.Description,
                StoreEmail = baseDto.StoreEmail,
                StorePhone = baseDto.StorePhone,
                ImageUrl = baseDto.ImageUrl,
                Address = baseDto.Address,
                Latitude = baseDto.Latitude,
                Longitude = baseDto.Longitude,
                IsApproved = baseDto.IsApproved,
                OwnerName = baseDto.OwnerName,
                Distance = Math.Round(distance, 2),
                EstimatedTravelTime = CalculateTravelTime(distance)
            };
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in km
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double angle) => Math.PI * angle / 180.0;

        private string CalculateTravelTime(double distance)
        {
            // Assume 30km/h average city speed
            double speedKmH = 30.0;
            double timeHours = distance / speedKmH;
            double timeMinutes = timeHours * 60;

            if (timeMinutes < 1) return "Less than 1 min";
            return $"{Math.Ceiling(timeMinutes)} mins";
        }

        private StoreDto MapToDto(Store store)
        {
            return new StoreDto
            {
                StoreId = store.StoreId,
                UserId = store.UserId,
                StoreName = store.StoreName,
                Description = store.Description,
                StoreEmail = store.StoreEmail,
                StorePhone = store.StorePhone,
                ImageUrl = store.ImageUrl,
                Address = store.Address,
                Latitude = store.Latitude,
                Longitude = store.Longitude,
                IsApproved = store.IsApproved,
                OwnerName = store.User?.FullName ?? "Unknown"
            };
        }
    }
}
