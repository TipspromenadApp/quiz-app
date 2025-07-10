using Microsoft.AspNetCore.Mvc;
using quiz_app.Models;
using Microsoft.EntityFrameworkCore;

namespace quiz_app.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class QuestionController : ControllerBase
  {
    private readonly AppDbContext _context;

    public QuestionController(AppDbContext context)
    {
      _context = context;
    }

    [HttpPost]
    public IActionResult CreateQuestion([FromBody] Question question)
    {
      try
      {
        if (question == null || string.IsNullOrWhiteSpace(question.Text) || string.IsNullOrWhiteSpace(question.CorrectAnswer))
        {
          return BadRequest(new { message = "Invalid question data: Text and CorrectAnswer are required." });
        }

        // For multiple-choice, ensure at least 3 options are provided
        if (question.OptionD == null && (string.IsNullOrWhiteSpace(question.OptionA) || string.IsNullOrWhiteSpace(question.OptionB) || string.IsNullOrWhiteSpace(question.OptionC)))
        {
          return BadRequest(new { message = "Multiple-choice questions require at least 3 options (OptionA, OptionB, OptionC)." });
        }

        // For multiple-choice, validate CorrectAnswer matches an option
        if (question.OptionD != null || !string.IsNullOrWhiteSpace(question.OptionA) || !string.IsNullOrWhiteSpace(question.OptionB) || !string.IsNullOrWhiteSpace(question.OptionC))
        {
          if (question.OptionD == null &&
              question.CorrectAnswer != question.OptionA &&
              question.CorrectAnswer != question.OptionB &&
              question.CorrectAnswer != question.OptionC)
          {
            return BadRequest(new { message = "CorrectAnswer must match one of the provided options (OptionA, OptionB, or OptionC) for multiple-choice questions." });
          }
          if (question.OptionD != null &&
              question.CorrectAnswer != question.OptionA &&
              question.CorrectAnswer != question.OptionB &&
              question.CorrectAnswer != question.OptionC &&
              question.CorrectAnswer != question.OptionD)
          {
            return BadRequest(new { message = "CorrectAnswer must match one of the provided options (OptionA, OptionB, OptionC, or OptionD) for multiple-choice questions." });
          }
        }

        var newQuestion = new Question
        {
          Text = question.Text,
          OptionA = question.OptionA,
          OptionB = question.OptionB,
          OptionC = question.OptionC,
          OptionD = question.OptionD,
          CorrectAnswer = question.CorrectAnswer
        };

        _context.Questions.Add(newQuestion);
        _context.SaveChanges();

        return Ok(new { message = "Question created successfully.", questionId = newQuestion.Id });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
      }
    }
  }
}

