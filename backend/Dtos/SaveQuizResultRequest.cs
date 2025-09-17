using System;
using System.Collections.Generic;

namespace quiz_app.Dtos
{
    public class SaveQuizResultRequest
    {
        public string UserName { get; set; } = "";
        public int RoundNumber { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime DateTaken { get; set; }
        public List<AnswerRecordDto> Answers { get; set; } = new();

      
        public string GameMode { get; set; } = "solo";  
        public string? BotName { get; set; }           
        public int? BotScore { get; set; }              
    }

    public class AnswerRecordDto
    {
        public int Round { get; set; }
        public string? QuestionId { get; set; }
        public string Question { get; set; } = "";
        public string? Type { get; set; }
        public string? SelectedAnswer { get; set; }
        public string? CorrectAnswer { get; set; }
        public bool? IsCorrect { get; set; }
        public string? UserAnswer { get; set; }
    }
}
