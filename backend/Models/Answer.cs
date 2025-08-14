namespace quiz_app.Models
{
    public class Answer
    {
        public int Id { get; set; }               
        public string Question { get; set; }
        public string SelectedAnswer { get; set; }
        public string CorrectAnswer { get; set; }
    }
}
