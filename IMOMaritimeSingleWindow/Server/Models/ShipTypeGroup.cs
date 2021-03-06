﻿using System;
using System.Collections.Generic;

namespace IMOMaritimeSingleWindow.Models
{
    public partial class ShipTypeGroup
    {
        public ShipTypeGroup()
        {
            ShipType = new HashSet<ShipType>();
        }

        public int ShipTypeGroupId { get; set; }
        public string ShipTypeGroupCode { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public ICollection<ShipType> ShipType { get; set; }
    }
}
