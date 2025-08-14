using System;

namespace quiz_app.Dtos
{
    // Minimal request body for saving ONE round
    public class SaveQuizResultRequest
    {
        public string UserName { get; set; }
        public int RoundNumber { get; set; }   // 1..5
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime DateTaken { get; set; }
        // (We’re not sending Answers right now; add later if you want)
    }
}

