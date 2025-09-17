using System.Collections.Generic;

namespace quiz_app.Dtos
{
    public class QuizResultDto
    {
        public string UserName { get; set; } = default!;
        public int Score { get; set; }
        public List<AnswerDto> Answers { get; set; } = new();

        public string GameMode { get; set; } = "solo";   
        public string? BotName { get; set; }             
        public int? BotScore { get; set; }             
    }
}
