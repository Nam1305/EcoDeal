using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;
using EcoDeal.Api.Mappers;
using EcoDeal.Api.Utils;

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
            return stores.Select(s => s.MapToDto());
        }

        public async Task<StoreDto?> GetStoreByIdAsync(int id)
        {
            var store = await _storeRepository.GetByIdAsync(id);
            return store?.MapToDto();
        }

        public async Task<PagedResponse<StoreDto>> GetPagedStoresAsync(int pageNumber, int pageSize)
        {
            var (items, totalCount) = await _storeRepository.GetPagedAsync(pageNumber, pageSize);
            return new PagedResponse<StoreDto>
            {
                Items = items.Select(s => s.MapToDto()),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<IEnumerable<StoreDto>> SearchStoresAsync(string name)
        {
            var stores = await _storeRepository.SearchByNameAsync(name);
            return stores.Select(s => s.MapToDto());
        }

        public async Task<IEnumerable<StoreDto>> GetStoresByApprovalStatusAsync(bool isApproved)
        {
            var stores = await _storeRepository.GetByApprovalStatusAsync(isApproved);
            return stores.Select(s => s.MapToDto());
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
            return createdStore.MapToDto();
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
            return store?.MapToDto();
        }

        public async Task<StoreDto> RegisterStoreAsync(StoreRegistrationDto dto, int userId)
        {
            // 1. Check if user already has a store
            var existingStore = await GetStoreByUserIdAsync(userId);
            if (existingStore != null)
                throw new Exception("You already have a registered store.");

            // 2. Create the store (Requires Admin Approval)
            var store = new Store
            {
                StoreName = dto.StoreName,
                Description = dto.Description,
                StoreEmail = dto.StoreEmail,
                StorePhone = dto.StorePhone,
                Address = dto.StoreAddress,
                ImageUrl = dto.ImageUrl,
                UserId = userId,
                IsApproved = false // Chờ Admin duyệt
            };

            var createdStore = await _storeRepository.AddAsync(store);

            // User Role is NOT updated here anymore. It gets updated only when Admin approves.
            return createdStore.MapToDto();
        }

        public async Task<IEnumerable<StoreNearbyDto>> GetNearbyStoresAsync(double lat, double lon, double radiusKm)
        {
            var allStores = await _storeRepository.GetAllAsync();
            var nearbyStores = new List<StoreNearbyDto>();

            foreach (var store in allStores)
            {
                if (!store.Latitude.HasValue || !store.Longitude.HasValue) continue;

                var distance = GeoUtils.CalculateDistance(lat, lon, (double)store.Latitude.Value, (double)store.Longitude.Value);
                if (distance <= radiusKm)
                {
                    var travelTime = CalculateTravelTime(distance);
                    nearbyStores.Add(store.MapToNearbyDto(distance, travelTime));
                }
            }

            return nearbyStores.OrderBy(s => s.Distance);
        }

        private string CalculateTravelTime(double distance)
        {
            // Assume 30km/h average city speed
            double speedKmH = 30.0;
            double timeHours = distance / speedKmH;
            double timeMinutes = timeHours * 60;

            if (timeMinutes < 1) return "Less than 1 min";
            return $"{Math.Ceiling(timeMinutes)} mins";
        }
    }
}
