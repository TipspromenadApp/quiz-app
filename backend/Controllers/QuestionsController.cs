using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

using iTextSharp.text;
using iTextSharp.text.pdf;

using quiz_app.Dtos;
using quiz_app.Models;
using quiz_app.Services;

namespace quiz_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public QuestionsController(AppDbContext context) { _context = context; }    

        [HttpPost("export-pdf")]
        public IActionResult ExportPdf([FromBody] SaveQuizResultRequest dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.UserName))
                return BadRequest("Invalid quiz result data.");

            var model = new QuizResult
            {
                UserName = dto.UserName,
                RoundNumber = dto.RoundNumber,
                Score = dto.Score,
                TotalQuestions = dto.TotalQuestions,
                DateTaken = dto.DateTaken,
                Answers = (dto.Answers ?? new List<AnswerRecordDto>()).Select(a => new QuizAnswer
                {
                    Round = a.Round,
                    QuestionId = a.QuestionId,
                    Question = a.Question ?? "",
                    Type = a.Type,
                    SelectedAnswer = a.SelectedAnswer,
                    CorrectAnswer = a.CorrectAnswer,
                    IsCorrect = a.IsCorrect,
                    UserAnswer = a.UserAnswer,
                }).ToList()
            };

            var pdfService = new PdfExportService();
            var pdfBytes = pdfService.GenerateQuizResultPdf(model);

            var fileName = $"QuizResult-{dto.UserName}-{dto.DateTaken:yyyyMMdd-HHmm}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpPost("export-summary")]
        public IActionResult ExportSummary([FromBody] SummaryResultModel summary)
        {
            var stream = new MemoryStream();
            var document = new Document();
            PdfWriter.GetInstance(document, stream).CloseStream = false;
            document.Open();

            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
            var textFont = FontFactory.GetFont(FontFactory.HELVETICA, 12);

            document.Add(new Paragraph("Quiz Summary Result", titleFont));
            document.Add(new Paragraph(" "));
            document.Add(new Paragraph($"Name: {summary.UserName}", textFont));
            document.Add(new Paragraph($"Date: {summary.DateTaken}", textFont));
            document.Add(new Paragraph($"Score: {summary.Score}", textFont));
            document.Add(new Paragraph(" "));
            document.Add(new Paragraph("Affirmation: " + summary.Affirmation, textFont));

            document.Close();
            stream.Position = 0;
            return File(stream, "application/pdf", "QuizSummary.pdf");
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Question>>> GetQuestions()
            => await _context.Questions.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Question>> GetQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return NotFound();
            return question;
        }

        [HttpPost]
        public async Task<ActionResult<Question>> CreateQuestion(Question question)
        {
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetQuestion), new { id = question.Id }, question);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return NotFound();

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet("by-round")]
        public async Task<ActionResult<IEnumerable<QuestionDto>>> GetByRound([FromQuery] int? round)
        {
            var rows = await _context.Questions.AsNoTracking().ToListAsync();

            var normalized = rows.Select(ToDto).Where(IsValidForBot).ToList();

            if (round.HasValue)
            {
                var withRound = normalized.Where(d => d.Round == round.Value).ToList();
                if (withRound.Count > 0) return Ok(withRound);
                return Ok(normalized.Take(10).ToList());
            }
            return Ok(normalized);
        }

        private static bool IsValidForBot(QuestionDto d) =>
            !string.IsNullOrWhiteSpace(d.Id) &&
            !string.IsNullOrWhiteSpace(d.Text) &&
            (string.Equals(d.Type, "text", StringComparison.OrdinalIgnoreCase)
                ? !string.IsNullOrWhiteSpace(d.CorrectAnswer)
                : (d.Options is { Count: >= 2 } && !string.IsNullOrWhiteSpace(d.CorrectAnswer)));       

        private static QuestionDto ToDto(Question q)
        {         
            var idStr = (GetString(q, "Id") ?? GetInt(q, "Id")?.ToString() ?? "").Trim();
          
            var text = (GetString(q, "QuestionText") ?? GetString(q, "Text") ?? "").Trim();           
            var options = GetStringList(q, "Options")
                          ?? TryParseJsonList(GetString(q, "OptionsJson"))
                          ?? SplitCsv(GetString(q, "OptionsCsv") ?? GetString(q, "OptionsString"))
                          ?? GetOptionColumns(q);
            if (options != null && options.Count == 0) options = null;          
            var typeRaw = (GetString(q, "Type") ?? GetString(q, "QuestionType"))?.Trim().ToLowerInvariant();
            var type = typeRaw switch
            {
                "multiple" or "multiple-choice" or "alternativ" or "flervalsfråga" or "flervalsfraga" or "mcq" => "mcq",
                "text" or "free" or "free-text" or "freetext" or "fritext" => "text",
                _ => options != null && options.Count >= 2 ? "mcq" : "text"
            };          
            var correct = (GetString(q, "CorrectAnswer") ?? GetString(q, "Answer"))?.Trim();           
            int? round = GetInt(q, "Round") ?? GetInt(q, "RoundNumber");

            return new QuestionDto
            {
                Id = idStr,
                Text = text,
                Type = type,
                Options = options,
                CorrectAnswer = correct,
                Round = round
            };
        }     

        private static string? GetString(object obj, string prop)
        {
            var p = obj.GetType().GetProperty(prop);
            if (p == null) return null;
            var v = p.GetValue(obj);
            return v as string ?? v?.ToString();
        }

        private static int? GetInt(object obj, string prop)
        {
            var p = obj.GetType().GetProperty(prop);
            if (p == null) return null;
            var v = p.GetValue(obj);
            if (v is int i) return i;
            if (int.TryParse(v?.ToString(), out var parsed)) return parsed;
            return null;
        }

        private static List<string>? GetStringList(object obj, string prop)
        {
            var p = obj.GetType().GetProperty(prop);
            if (p == null || p.PropertyType == typeof(string)) return null;
            var v = p.GetValue(obj);
            if (v is IEnumerable<string> list)
                return list.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()).ToList();
            return null;
        }

        private static List<string>? TryParseJsonList(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return null;
            try
            {
                var list = JsonSerializer.Deserialize<List<string>>(json);
                return list?.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()).ToList();
            }
            catch { return null; }
        }

        private static List<string>? SplitCsv(string? csv)
        {
            if (string.IsNullOrWhiteSpace(csv)) return null;
            var parts = csv.Split(new[] { '|', ';', ',', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                           .Select(s => s.Trim()).Where(s => s.Length > 0).ToList();
            return parts.Count > 0 ? parts : null;
        }      
        private static List<string>? GetOptionColumns(object obj)
        {           
            var numeric = new[] { "Option1", "Option2", "Option3", "Option4" };
            var list = new List<string>();
            foreach (var n in numeric)
            {
                var s = GetString(obj, n);
                if (!string.IsNullOrWhiteSpace(s)) list.Add(s.Trim());
            }
            if (list.Count >= 2) return list;            
            var alpha = new[] { "OptionA", "OptionB", "OptionC", "OptionD" };
            list.Clear();
            foreach (var n in alpha)
            {
                var s = GetString(obj, n);
                if (!string.IsNullOrWhiteSpace(s)) list.Add(s.Trim());
            }
            return list.Count >= 2 ? list : null;
        }
    }
}

