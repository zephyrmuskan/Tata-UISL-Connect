namespace TataUisl.Core.Entities
{
    public class ApplicationWorkflow
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public int RouteId { get; set; }
        public string LevelGroup { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // e.g. Pending, Completed

        public WorkflowRoute? Route { get; set; }
        public Application? Application { get; set; }
    }
}
