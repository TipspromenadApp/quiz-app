namespace quiz_app.Models.Dto
{
    public class GeneratedQuestionDto
    {
        public int Id { get; set; } = 0;
        public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = "mcq";
        public string[] Options { get; set; } = Array.Empty<string>();
        public int CorrectIndex { get; set; } = 0;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string Topic { get; set; } = "general";
        public string Difficulty { get; set; } = "easy";
        public string Source { get; set; } = "api";
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public string VariantId { get; set; } = Guid.NewGuid().ToString();
        public string Status { get; set; } = "generated";
    }
}
