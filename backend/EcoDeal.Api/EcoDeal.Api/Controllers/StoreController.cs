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

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("my-store")]
        public async Task<ActionResult<StoreDto>> GetMyStore()
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId))
            {
                var store = await _storeService.GetStoreByUserIdAsync(userId);
                if (store == null) return NotFound(new { message = "You do not have a registered store." });
                return Ok(store);
            }
            return Unauthorized();
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

        [HttpGet("nearby")]
        public async Task<ActionResult<IEnumerable<StoreNearbyDto>>> GetNearby([FromQuery] double lat, [FromQuery] double lon, [FromQuery] double radius = 5.0)
        {
            var stores = await _storeService.GetNearbyStoresAsync(lat, lon, radius);
            return Ok(stores);
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPost("register")]
        public async Task<ActionResult<StoreDto>> Register([FromBody] StoreRegistrationDto request)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId))
            {
                try
                {
                    var store = await _storeService.RegisterStoreAsync(request, userId);
                    return CreatedAtAction(nameof(GetById), new { id = store.StoreId }, store);
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = ex.Message });
                }
            }
            return Unauthorized();
        }

        [HttpPost]
        public async Task<ActionResult<StoreDto>> Create([FromBody] CreateStoreRequest request, [FromQuery] int userId)
        {
            var store = await _storeService.AddStoreAsync(request, userId);
            return CreatedAtAction(nameof(GetById), new { id = store.StoreId }, store);
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("my-store")]
        public async Task<IActionResult> UpdateMyStore([FromBody] UpdateStoreRequest request)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId))
            {
                var store = await _storeService.GetStoreByUserIdAsync(userId);
                if (store == null) return NotFound(new { message = "You do not have a registered store." });
                
                await _storeService.UpdateStoreAsync(store.StoreId, request);
                return NoContent();
            }
            return Unauthorized();
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
