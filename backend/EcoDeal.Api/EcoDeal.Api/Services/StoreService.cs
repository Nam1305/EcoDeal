using EcoDeal.Api.DTOs;
using EcoDeal.Api.Models;
using EcoDeal.Api.Repositories;

namespace EcoDeal.Api.Services
{
    public class StoreService : IStoreService
    {
        private readonly IStoreRepository _storeRepository;

        public StoreService(IStoreRepository storeRepository)
        {
            _storeRepository = storeRepository;
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

        private StoreDto MapToDto(Store store)
        {
            return new StoreDto
            {
                StoreId = store.StoreId,
                UserId = store.UserId,
                StoreName = store.StoreName,
                Address = store.Address,
                Latitude = store.Latitude,
                Longitude = store.Longitude,
                IsApproved = store.IsApproved,
                OwnerName = store.User?.FullName ?? "Unknown"
            };
        }
    }
}
