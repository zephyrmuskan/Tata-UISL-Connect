using System.Collections.Generic;

namespace TataUisl.Core.Entities
{
    public class WorkflowRoute
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LevelGroup { get; set; } = string.Empty;

        public ICollection<WorkflowStage> Stages { get; set; } = new List<WorkflowStage>();
    }
}
