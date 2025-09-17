using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using quiz_app.Models;
using System;
using System.Reflection;

namespace quiz_app.Services
{
    public class PdfExportService
    {
        public byte[] GenerateQuizResultPdf(QuizResult result)
        {
            var gameMode = ReadString(result, "GameMode")?.ToLowerInvariant();
            var botName  = ReadString(result, "BotName");
            var botScore = ReadNullableInt(result, "BotScore");

            bool showBot =
                string.Equals(gameMode, "bot", StringComparison.OrdinalIgnoreCase) ||
                !string.IsNullOrWhiteSpace(botName) ||
                botScore.HasValue;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(50);
                    page.Size(PageSizes.A4);

                    page.Header().Text($"Quizresultat – {result.UserName}")
                        .FontSize(20)
                        .Bold();

                    page.Content().Column(col =>
                    {
                        col.Item().Text($"Datum: {result.DateTaken:yyyy-MM-dd HH:mm}");

                        if (showBot)
                        {
                            var botLabel = string.IsNullOrWhiteSpace(botName) ? "Bot" : botName!;
                            var botScoreText = botScore.HasValue ? botScore.Value.ToString() : "—";
                            col.Item().Text($"Ställning – Du: {result.Score} • {botLabel}: {botScoreText}");
                        }
                        else
                        {
                            col.Item().Text($"Poäng: {result.Score}");
                        }

                        col.Item().PaddingVertical(10).LineHorizontal(1);

                        col.Item().Text("Svar:")
                            .FontSize(16)
                            .Bold();

                        foreach (var answer in result.Answers)
                        {
                            var selectedAnswer = ReadString(answer, "SelectedAnswer");
                            var userAnswer     = ReadString(answer, "UserAnswer");
                            var chosenAnswer   = !string.IsNullOrWhiteSpace(selectedAnswer) ? selectedAnswer : (userAnswer ?? "");
                            var correctAnswer  = ReadString(answer, "CorrectAnswer") ?? "";
                            bool isCorrect     = string.Equals(chosenAnswer, correctAnswer, StringComparison.Ordinal);

                            var questionText   = ReadString(answer, "Question") ?? "";

                            col.Item().Text($"Fråga: {questionText}")
                                .FontSize(12);

                            col.Item().Text(text =>
                            {
                                text.Span("Ditt svar: ").FontSize(12).Italic();
                                text.Span(string.IsNullOrWhiteSpace(chosenAnswer) ? "—" : chosenAnswer)
                                    .FontSize(12)
                                    .Italic()
                                    .FontColor(isCorrect ? "#2E7D32" : "#C62828");
                            });

                            if (!isCorrect && !string.IsNullOrWhiteSpace(correctAnswer))
                            {
                                col.Item().Text(text =>
                                {
                                    text.Span("Rätt svar: ").FontSize(12).Italic();
                                    text.Span(correctAnswer)
                                        .FontSize(12)
                                        .Italic()
                                        .FontColor("#2E7D32");
                                });
                            }

                            col.Item().PaddingBottom(10);
                        }
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text("Utarbetat av Quiz Explorers – där kunskap väcks till liv.");
                });
            });

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

        private static string? ReadString(object obj, string name)
        {
            var p = obj.GetType().GetProperty(name, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase);
            var v = p?.GetValue(obj);
            return v?.ToString();
        }

        private static int? ReadNullableInt(object obj, string name)
        {
            var p = obj.GetType().GetProperty(name, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase);
            var v = p?.GetValue(obj);
            if (v == null) return null;
            if (v is int i) return i;
            if (v is long l) return unchecked((int)l);
            if (v is short s) return (int)s;
            if (v is byte b) return (int)b;
            if (int.TryParse(v.ToString(), out var parsed)) return parsed;
            return null;
        }
    }
}
