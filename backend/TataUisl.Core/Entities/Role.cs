using System.Collections.Generic;

namespace TataUisl.Core.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g., Admin, Customer

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}
