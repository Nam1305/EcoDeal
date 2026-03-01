using EcoDeal.Api.DTOs;
using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcoDeal.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoreController : ControllerBase
    {
        private readonly IStoreService _storeService;

        public StoreController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResponse<StoreDto>>> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _storeService.GetPagedStoresAsync(pageNumber, pageSize);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StoreDto>> GetById(int id)
        {
            var store = await _storeService.GetStoreByIdAsync(id);
            if (store == null) return NotFound();
            return Ok(store);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<StoreDto>>> Search([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Search name cannot be empty.");
            var stores = await _storeService.SearchStoresAsync(name);
            return Ok(stores);
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<StoreDto>>> Filter([FromQuery] bool isApproved)
        {
            var stores = await _storeService.GetStoresByApprovalStatusAsync(isApproved);
            return Ok(stores);
        }

        [HttpPost]
        public async Task<ActionResult<StoreDto>> Create([FromBody] CreateStoreRequest request, [FromQuery] int userId)
        {
            var store = await _storeService.AddStoreAsync(request, userId);
            return CreatedAtAction(nameof(GetById), new { id = store.StoreId }, store);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStoreRequest request)
        {
            await _storeService.UpdateStoreAsync(id, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _storeService.DeleteStoreAsync(id);
            return NoContent();
        }
    }
}
