namespace quiz_app.Models.Dto
{
    public class EditQuestionRequest
    {
        public string Text { get; set; } = string.Empty;
        public string[] Options { get; set; } = Array.Empty<string>();
        public int CorrectIndex { get; set; } = 0;

        public string Topic { get; set; } = "general";
        public string Difficulty { get; set; } = "easy";

        public string? OriginalVariantId { get; set; } = null;
    }
}
