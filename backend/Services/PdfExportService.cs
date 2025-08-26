using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using quiz_app.Models;
using System;

namespace quiz_app.Services
{
    public class PdfExportService
    {
        public byte[] GenerateQuizResultPdf(QuizResult result)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(50);
                    page.Size(PageSizes.A4);

                    // Sidhuvud
                    page.Header().Text($"Quizresultat – {result.UserName}")
                        .FontSize(20)
                        .Bold();

                    // Innehåll
                    page.Content().Column(col =>
                    {
                        col.Item().Text($"Datum: {result.DateTaken:yyyy-MM-dd HH:mm}");
                        col.Item().Text($"Poäng: {result.Score}");

                        col.Item().PaddingVertical(10).LineHorizontal(1);

                        col.Item().Text("Svar:")
                            .FontSize(16)
                            .Bold();

                        foreach (var answer in result.Answers)
                        {
                            bool isCorrect = answer.SelectedAnswer == answer.CorrectAnswer;

                            col.Item().Text($"Fråga: {answer.Question}")
                                .FontSize(12);

                            col.Item().Text(text =>
                            {
                                text.Span("Ditt svar: ").FontSize(12).Italic();
                                text.Span(answer.SelectedAnswer)
                                    .FontSize(12)
                                    .Italic()
                                    .FontColor(isCorrect ? "#2E7D32" : "#C62828");
                            });

                            if (!isCorrect)
                            {
                                col.Item().Text(text =>
                                {
                                    text.Span("Rätt svar: ").FontSize(12).Italic();
                                    text.Span(answer.CorrectAnswer)
                                        .FontSize(12)
                                        .Italic()
                                        .FontColor("#2E7D32");
                                });
                            }

                            col.Item().PaddingBottom(10);
                        }
                    });

                    // Sidfot
                    page.Footer()
                        .AlignCenter()
                        .Text("Utarbetat av Quiz Explorers – där kunskap väcks till liv.");
                });
            });

            // Metadata
            var metadata = new DocumentMetadata
            {
                Title    = $"Quizresultat – {result.UserName}",
                Author   = result.UserName,
                Creator  = "Utarbetat av Quiz Explorers – där kunskap väcks till liv",
                Subject  = "Quizresultat",
                Keywords = "quiz, resultat, lärande"
            };

            return document.WithMetadata(metadata).GeneratePdf();
        }
    }
}
