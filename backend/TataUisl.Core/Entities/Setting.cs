namespace TataUisl.Core.Entities
{
    public class Setting
    {
        public int Id { get; set; }
        public string Key { get; set; } = string.Empty; // e.g. support_email, support_phone
        public string Value { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
