using Microsoft.AspNetCore.Mvc;
using quiz_app.Services;
using quiz_app.Models.Dto;

namespace quiz_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionGenController : ControllerBase
    {
        private readonly IFakeQuestionGenerator _gen;
        public QuestionGenController(IFakeQuestionGenerator gen) => _gen = gen;

        [HttpGet("generate-by-round")]
        public ActionResult<IEnumerable<GeneratedQuestionDto>> GenerateByRound(
            [FromQuery] int round,
            [FromQuery] int count,
            [FromQuery] string? difficulty = "easy",
            [FromQuery] string? topic = null)
        {
            if (round <= 0 || count <= 0) return BadRequest("round and count must be > 0");
            var data = _gen.GenerateByRound(round, count, difficulty, topic);
            return Ok(data);
        }
        [HttpGet("generateByRound")]
        public ActionResult<IEnumerable<GeneratedQuestionDto>> GenerateByRoundAlias(
            [FromQuery] int round,
            [FromQuery] int count,
            [FromQuery] string? difficulty = "easy",
            [FromQuery] string? topic = null)
            => GenerateByRound(round, count, difficulty, topic);
    }
}
