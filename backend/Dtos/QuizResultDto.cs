using System.Collections.Generic;

namespace quiz_app.Dtos
{
    // Use this if you return results to the frontend later
    public class QuizResultDto
    {
        public string UserName { get; set; }
        public int Score { get; set; }
        public List<AnswerDto> Answers { get; set; }
    }
}
