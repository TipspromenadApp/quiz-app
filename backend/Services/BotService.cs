using System;
using System.Linq;
using System.Text;                   
using System.Globalization;           
using System.Text.Json.Serialization;

public class BotService
{
    private readonly Dictionary<string,(double acc,int deadlineMs)> _cfg = new()
    {
        ["easy"]   = (0.05, 1800),
        ["normal"] = (0.70, 1100),
        ["hard"]   = (0.90, 700),
    };    
    private static string Norm(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return "";
        var formD = s.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var noMarks = formD.Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark);
        return new string(noMarks.ToArray()).Normalize(NormalizationForm.FormC);
    }

    public MoveResponse Decide(MoveRequest r)
    {
        var key = (r.Difficulty ?? "normal").ToLowerInvariant();
        var (acc, baseDeadline) = _cfg.TryGetValue(key, out var c) ? c : _cfg["normal"];

        var options = r.Options ?? Array.Empty<string>();

        int seed = HashCode.Combine(r.QuestionId ?? "", string.Join("|", options), DateTime.UtcNow.Ticks);
        var rng = new Random(seed);        
        int correctIdx = -1;
        if (!string.IsNullOrWhiteSpace(r.CorrectAnswer) && options.Length > 0)
        {
            var want = Norm(r.CorrectAnswer);
            for (int i = 0; i < options.Length; i++)
            {
                if (Norm(options[i]) == want) { correctIdx = i; break; }
            }
        }

        bool pickCorrect = correctIdx >= 0 && rng.NextDouble() < acc;

        int answerIdx;
        if (pickCorrect)
        {
            answerIdx = correctIdx;
        }
        else
        {
            var pool = Enumerable.Range(0, options.Length).Where(i => i != correctIdx).ToList();
            answerIdx = pool.Count > 0 ? pool[rng.Next(pool.Count)] : Math.Max(0, correctIdx);
        }

        int jitter = rng.Next(-120, 160);
        int decideInMs = Math.Max(200, baseDeadline + jitter);

        var chosenText = (answerIdx >= 0 && answerIdx < options.Length) ? options[answerIdx] : null;

        return new MoveResponse
        {
            AnswerIndex = answerIdx,
            AnswerText  = chosenText,                        
            DecideInMs  = decideInMs,
            IsCorrect   = (correctIdx >= 0 && answerIdx == correctIdx),
            Seed        = seed
        };
    }
}

public class MoveRequest
{
    [JsonPropertyName("questionId")]   public string?  QuestionId    { get; set; }
    [JsonPropertyName("options")]      public string[]? Options      { get; set; }
    [JsonPropertyName("difficulty")]   public string?  Difficulty    { get; set; } 
    [JsonPropertyName("correctAnswer")]public string?  CorrectAnswer { get; set; } 
}

public class MoveResponse
{
    [JsonPropertyName("answerIndex")]  public int     AnswerIndex { get; set; }
    [JsonPropertyName("answerText")]   public string? AnswerText  { get; set; }   
    [JsonPropertyName("decideInMs")]   public int     DecideInMs  { get; set; }
    [JsonPropertyName("isCorrect")]    public bool    IsCorrect   { get; set; }
    [JsonPropertyName("seed")]         public int     Seed        { get; set; }
}
