namespace quiz_app.Dtos
{
    public class QuestionDto
    {
        public string Id { get; set; } = default!;
        public string Text { get; set; } = default!;
        public string? Type { get; set; } = "mcq";     // "mcq" or "text"
        public List<string>? Options { get; set; }     // for MCQ
        public string? CorrectAnswer { get; set; }     // exact text to match an option for MCQ
        public int? Round { get; set; }                // optional
    }
}
