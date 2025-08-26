using System.Collections.Generic;

namespace quiz_app.Dtos
{
   
    public class QuizResultDto
    {
        public string UserName { get; set; }
        public int Score { get; set; }
        public List<AnswerDto> Answers { get; set; }
    }
}
