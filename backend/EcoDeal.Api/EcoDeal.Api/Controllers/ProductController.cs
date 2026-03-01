using EcoDeal.Api.DTOs;
using EcoDeal.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcoDeal.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }


        //Get all products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        //Get cheapest products
        [HttpGet("cheapest")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetCheapest(int count = 3)
        {
            var products = await _productService.GetCheapestProductsAsync(count);
            return Ok(products);
        }

        //Get product by id
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        //Get paged products
        [HttpGet("paged")]
        public async Task<ActionResult<PagedResponse<ProductDto>>> GetPaged(int pageNumber = 1, int pageSize = 10)
        {
            var response = await _productService.GetPagedProductsAsync(pageNumber, pageSize);
            return Ok(response);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetByName(string name)
        {
            var products = await _productService.SearchProductsByNameAsync(name);
            return Ok(products);
        }

        [HttpGet("search-by-name")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetByNameExplicit([FromQuery] string name)
        {
            var products = await _productService.SearchProductsByNameAsync(name);
            return Ok(products);
        }

        //Create product
        [HttpPost]
        public async Task<ActionResult<ProductDto>> Create(CreateProductRequest request)
        {
            var createdProduct = await _productService.CreateProductAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = createdProduct.ProductId }, createdProduct);
        }

        //Update product
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateProductRequest request)
        {
            await _productService.UpdateProductAsync(id, request);
            return NoContent();
        }

        //Delete product
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _productService.DeleteProductAsync(id);
            return NoContent();
        }
    }
}
