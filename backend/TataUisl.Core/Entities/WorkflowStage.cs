namespace TataUisl.Core.Entities
{
    public class WorkflowStage
    {
        public int Id { get; set; }
        public int RouteId { get; set; }
        public string StageName { get; set; } = string.Empty;
        public int SequenceOrder { get; set; }
        public string WorkflowLevel { get; set; } = string.Empty; // e.g. Level 1, Level 2
        public string Department { get; set; } = string.Empty;
        public string RequiredAction { get; set; } = string.Empty;

        public WorkflowRoute? Route { get; set; }
    }
}
