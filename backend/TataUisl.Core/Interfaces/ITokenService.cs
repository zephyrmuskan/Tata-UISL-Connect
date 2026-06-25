using TataUisl.Core.Entities;

namespace TataUisl.Core.Interfaces
{
    public interface ITokenService
    {
        string GenerateJwtToken(User user);
    }
}
