using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

[ApiController]
[Route("api/bot")]
public class BotController : ControllerBase
{
    private readonly BotService _svc;
    public BotController(BotService svc) => _svc = svc;

    [HttpPost("move")]
    public ActionResult<MoveResponse> Move([FromBody] MoveRequest req)
    {
        if (req == null) return BadRequest("No body.");
        if (req.Options == null || req.Options.Length == 0)
            return BadRequest("Missing options.");       
        var res = _svc.Decide(new MoveRequest
        {
            QuestionId    = req.QuestionId,
            Options       = req.Options,
            Difficulty    = string.IsNullOrWhiteSpace(req.Difficulty) ? "normal" : req.Difficulty,
            CorrectAnswer = req.CorrectAnswer
        });

        return Ok(res);
    }

    [HttpPost("think")]
    public async Task<IActionResult> Think([FromBody] BotRequest req, CancellationToken ct)
    {
        if (req == null) return BadRequest("No body.");
        if (req.Options == null || req.Options.Count == 0)
            return BadRequest("Missing options.");
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var latency = (req.Difficulty ?? "normal").ToLowerInvariant() switch
        {
            "easy" => 5000,
            "hard" => 2000,
            _      => 3000
        };
        await Task.Delay(latency, ct);      
        var svcReq = new MoveRequest
        {
            QuestionId    = req.QuestionId,
            Options       = req.Options.ToArray(),  
            Difficulty    = req.Difficulty,
            CorrectAnswer = req.CorrectAnswer
        };

        var svcRes = _svc.Decide(svcReq);

        var (answerIndex, isCorrect) = MapToUnified(svcRes, req);
        return Ok(new { answerIndex, isCorrect });
    } 

    private static (int answerIndex, bool isCorrect) MapToUnified(object svcRes, BotRequest req)
    {
        int answerIndex = -1;
        bool? svcSaysCorrect = null;

        if (svcRes != null)
        {
            var t = svcRes.GetType();

            answerIndex = ReadIntProp(t, svcRes, "AnswerIndex")
                       ?? ReadIntProp(t, svcRes, "Index")
                       ?? ReadIntProp(t, svcRes, "SelectedIndex")
                       ?? -1;

            svcSaysCorrect = ReadBoolProp(t, svcRes, "IsCorrect")
                          ?? ReadBoolProp(t, svcRes, "Correct")
                          ?? ReadBoolProp(t, svcRes, "Success");
        }        
        if (svcSaysCorrect.HasValue) return (answerIndex, svcSaysCorrect.Value);        
        bool computed = false;
        if (answerIndex >= 0
            && answerIndex < (req.Options?.Count ?? 0)
            && !string.IsNullOrWhiteSpace(req.CorrectAnswer))
        {
            var picked = req.Options[answerIndex];
            computed = string.Equals(picked, req.CorrectAnswer, System.StringComparison.Ordinal);
        }

        return (answerIndex, computed);
    }

    private static int? ReadIntProp(System.Type t, object obj, string name)
        => t.GetProperty(name, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase)
            ?.GetValue(obj) is int v ? v : (int?)null;

    private static bool? ReadBoolProp(System.Type t, object obj, string name)
        => t.GetProperty(name, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase)
            ?.GetValue(obj) is bool v ? v : (bool?)null;
}

public sealed class BotRequest
{
    public string? QuestionId { get; set; }
    public string Text { get; set; } = "";
    public List<string> Options { get; set; } = new();
    public string Difficulty { get; set; } = "normal";
    public string? CorrectAnswer { get; set; }
}
