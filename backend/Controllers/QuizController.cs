using Microsoft.AspNetCore.Mvc;
using quiz_app.Models;

namespace quiz_app.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("start")]
public IActionResult StartQuiz(int count, bool random)
{
    var questions = random
        ? _context.Questions.OrderBy(q => Guid.NewGuid()).Take(count).ToList()
        : _context.Questions.OrderBy(q => q.Id).Take(count).ToList();

    return Ok(questions);
}

        }
    }

