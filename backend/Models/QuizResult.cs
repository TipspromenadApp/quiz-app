using System;
using System.Collections.Generic;

namespace quiz_app.Models
{
    public class QuizResult
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public DateTime DateTaken { get; set; } = DateTime.Now;
        public int Score { get; set; }
        public List<AnswerEntry> Answers { get; set; } = new List<AnswerEntry>();
        public int RoundNumber { get; set; }

    }

    public class AnswerEntry
    {
        public int Id { get; set; }
        public string Question { get; set; }
        public string SelectedAnswer { get; set; }
        public string CorrectAnswer { get; set; }
    }
}
