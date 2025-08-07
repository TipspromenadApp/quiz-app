using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quiz_app.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace quiz_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizResultController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizResultController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SaveQuizResult([FromBody] QuizResult quizResult)
        {
            if (quizResult == null)
                return BadRequest("Invalid quiz result");

            _context.QuizResults.Add(quizResult);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Result saved successfully" });

        }
        [HttpGet]
public async Task<ActionResult<IEnumerable<QuizResult>>> GetResults()
{
    var results = await _context.QuizResults
        .Include(q => q.Answers)
        .OrderByDescending(q => q.DateTaken)
        .ToListAsync();

    return Ok(results);
}

    }
}
