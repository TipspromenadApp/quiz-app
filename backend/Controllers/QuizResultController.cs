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
                UserName = req.UserName.Trim(),
                RoundNumber = req.RoundNumber,
                Score = req.Score,
                TotalQuestions = req.TotalQuestions,
                DateTaken = req.DateTaken == default ? DateTime.UtcNow : req.DateTaken,
                Answers = req.Answers?.Select(a => new QuizAnswer
                {
                    Round = a.Round,
                    QuestionId = a.QuestionId,
                    Question = a.Question,
                    Type = a.Type,
                    SelectedAnswer = a.SelectedAnswer,
                    CorrectAnswer = a.CorrectAnswer,
                    IsCorrect = a.IsCorrect,
                    UserAnswer = a.UserAnswer
                }).ToList() ?? new List<QuizAnswer>()
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


[HttpGet("{userName}")]
public async Task<IActionResult> GetForUser(string userName)
{
    var items = await _context.QuizResults
        .Where(x => x.UserName == userName)
        .Include(x => x.Answers)
        .OrderByDescending(x => x.DateTaken)
        .ToListAsync();

    return Ok(items);
}


[HttpGet("{userName}/paged")]
public async Task<IActionResult> GetForUserPaged(
    string userName,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
{
    if (page < 1) page = 1;
    if (pageSize <= 0 || pageSize > 200) pageSize = 20;

    var baseQuery = _context.QuizResults
        .Where(x => x.UserName == userName)
        .OrderByDescending(x => x.DateTaken);

    var total = await baseQuery.CountAsync();
    var items = await baseQuery
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Include(x => x.Answers)
        .ToListAsync();

    return Ok(new { total, page, pageSize, items });
}


[HttpDelete("{id:int}")]
public async Task<IActionResult> DeleteOne(int id)
{
    var entity = await _context.QuizResults
        .Include(x => x.Answers)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (entity == null) return NotFound();

    
    _context.RemoveRange(entity.Answers);
    _context.QuizResults.Remove(entity);

    await _context.SaveChangesAsync();
    return NoContent();
}


[HttpDelete("user/{userName}")]
public async Task<IActionResult> DeleteAllForUser(string userName)
{
    var rounds = await _context.QuizResults
        .Where(x => x.UserName == userName)
        .Include(x => x.Answers)
        .ToListAsync();

    if (rounds.Count == 0) return NoContent();

    foreach (var r in rounds)
        _context.RemoveRange(r.Answers);

    _context.QuizResults.RemoveRange(rounds);
    await _context.SaveChangesAsync();
    return NoContent();
}

    }
}
