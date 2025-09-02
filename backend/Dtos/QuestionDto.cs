namespace quiz_app.Dtos
{
    public class QuestionDto
    {
        public string Id { get; set; } = default!;
        public string Text { get; set; } = default!;
        public string? Type { get; set; } = "mcq";    
        public List<string>? Options { get; set; }    
        public string? CorrectAnswer { get; set; }     
        public int? Round { get; set; }              
    }
}
