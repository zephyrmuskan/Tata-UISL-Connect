namespace TataUisl.Core.Entities
{
    public class ConnectionType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g. Domestic New Connection, Commercial Transfer
        public string Category { get; set; } = string.Empty; // e.g. Domestic, Commercial, Industrial, Other
    }
}
