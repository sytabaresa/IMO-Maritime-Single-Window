using System.Threading.Tasks;
using IMOMaritimeSingleWindow.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace IMOMaritimeSingleWindow.Controllers
{
    public interface IAccountController
    {
        Task<IActionResult> Register([FromBody]RegistrationViewModel model);

        /// <summary>
        /// Let's a user confirm their ownership of the
        /// email address that was assigned when
        /// the account was created.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="emailConfirmationToken"></param>
        /// <returns>A password reset token used by the application to
        /// let the user assign their own password to their account.</returns>
        Task<IActionResult> ConfirmEmail(string userId, [Bind(Prefix="token")] string emailConfirmationToken);

        /// <summary>
        /// Lets a logged in user change their password.
        /// </summary>
        /// <param name="model"></param>
        /// <returns> An HTTP 200 OK reponse if the password was successfully changed. </returns>
        Task<IActionResult> ChangePassword([FromBody]ChangePasswordViewModel model);

        /// <summary>
        /// Lets a user request a password reset link
        /// to their email account in the event that the
        /// user has forgotten their password.
        /// </summary>
        /// <param name="userName"></param>
        /// <returns>A password reset link</returns>
        Task<IActionResult> ForgotPassword(string userName);

        /// <summary>
        /// Lets a user change their password after verification
        /// of account ownership (i.e. via email link).
        /// </summary>
        /// <param name="model"></param>
        /// <returns> An HTTP 200 OK reponse if the provided password
        /// reset token was valid and the password was successfully reset. </returns>
        Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel model);
        
        /// <summary>
        /// Gets the roles assignable to users.
        /// </summary>
        /// <returns>A list of rolenames</returns>
        Task<IActionResult> GetAllRoles();

        /// <summary>
        /// Gets the display name of the logged in user
        /// </summary>
        /// <returns>Display name as a string</returns>
        Task<IActionResult> GetDisplayName();

        /// <summary>
        /// Gets the user by email address
        /// </summary>
        /// <param name="email">The email address of the user</param>
        /// <returns></returns>
        Task<IActionResult> GetUserByEmail(string email);

        /// <summary>
        /// Checks whether a user with the given email address has been created already.
        /// </summary>
        /// <param name="email">The email address to search by</param>
        /// <returns>A boolean</returns>
        Task<IActionResult> EmailTaken(string email);

        /// <summary>
        /// Gets the claims of the logged in user
        /// </summary>
        /// <returns>A list of claims</returns>
        Task<IActionResult> GetUserClaims();
    }
}
