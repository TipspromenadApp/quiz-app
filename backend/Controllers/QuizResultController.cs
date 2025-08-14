using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quiz_app.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using quiz_app.Dtos; 


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
public async Task<IActionResult> Save([FromBody] SaveQuizResultRequest req)
{
    if (req == null) return BadRequest("Body is required.");
    if (string.IsNullOrWhiteSpace(req.UserName)) return BadRequest("UserName is required.");
    if (req.RoundNumber <= 0) return BadRequest("RoundNumber must be >= 1.");

    var entity = new QuizResult
    {
        UserName   = req.UserName,
        RoundNumber= req.RoundNumber,
        Score      = req.Score,
        DateTaken  = req.DateTaken == default ? DateTime.UtcNow : req.DateTaken
    };

    _context.QuizResults.Add(entity);
    await _context.SaveChangesAsync();
    return Ok(entity.Id);
}


[HttpGet("progress/{userName}")]
public async Task<IActionResult> GetUserProgress(string userName)
{
    var roundsCompleted = await _context.QuizResults
        .Where(r => r.UserName == userName && r.RoundNumber > 0)
        .Select(r => r.RoundNumber)
        .Distinct()
        .CountAsync();

    return Ok(new { roundsCompleted, totalRounds = 5 });
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
