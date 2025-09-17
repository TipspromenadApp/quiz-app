using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using quiz_app.Dtos;

namespace quiz_app.Models
{
    public class QuizResult
    {
        public int Id { get; set; }
        public string UserName { get; set; } = "";
        public int RoundNumber { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime DateTaken { get; set; }

        public List<QuizAnswer> Answers { get; set; } = new();
         public string? GameMode { get; set; }  
    public string? BotName { get; set; }   
    public int? BotScore { get; set; }
    }
    
    

    public class QuizAnswer
    {
        public int Id { get; set; }

        public int QuizResultId { get; set; }
        [JsonIgnore] public QuizResult QuizResult { get; set; } = default!;

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
