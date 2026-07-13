namespace TataUisl.Core.Entities
{
    public class OfficerAssignment
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string StageName { get; set; } = string.Empty;
        public int OfficerId { get; set; }

        public User? Officer { get; set; }
    }
}
