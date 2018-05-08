using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using IMOMaritimeSingleWindow.Data;
using IMOMaritimeSingleWindow.Models;
using IMOMaritimeSingleWindow.Helpers;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;

namespace IMOMaritimeSingleWindow.Controllers
{
    [Route("api/[controller]")]
    public class ClaimController : Controller
    {
        readonly open_ssnContext _context;

        public ClaimController(open_ssnContext context)
        {
            _context = context;
        }

        [HttpGet("getall")]
        public IActionResult GetAll()
        {
            var claimList = _context.Claim.ToList();
            return Json(claimList);
        }
    }
}