using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using quiz_app.Models;
using quiz_app.Services;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace quiz_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuestionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("export-pdf")]
        public IActionResult ExportPdf([FromBody] QuizResult result)
        {
            var pdfService = new PdfExportService();
            var pdfBytes = pdfService.GenerateQuizResultPdf(result);

            return File(pdfBytes, "application/pdf", "QuizResult.pdf");
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
        {
            return await _context.Questions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Question>> GetQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
            {
                return NotFound();
            }

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
            if (question == null)
            {
                return NotFound();
            }

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

