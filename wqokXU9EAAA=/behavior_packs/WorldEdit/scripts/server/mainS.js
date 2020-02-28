const mainS = server.registerSystem(0,0);

let firstX;
let firstY;
let firstZ;
let isSet = false;

mainS.initialize = function() {
    this.listenForEvent ("minecraft:block_destruction_started", (eventData) => this.onPlace(eventData));
};

mainS.onPlace = function(eventData) {
    let BroadcastEventData = this.createEventData("minecraft:display_chat_event");
    let handContainer = this.getComponent(eventData.data.player, "minecraft:hand_container");
    let handItem = handContainer.data[0];


    let playerInventory = this.getComponent(eventData.data.player, "minecraft:hotbar_container");
    let firstItemSlot = playerInventory.data[0];

    let curX = eventData.data.block_position.x;
    let curY = eventData.data.block_position.y;
    let curZ = eventData.data.block_position.z;


    if (firstItemSlot.item == "minecraft:undefined") {
        BroadcastEventData.data.message = "Please set the item to the left of the hot bar"
        this.broadcastEvent("minecraft:display_chat_event", BroadcastEventData);
    } else {
        if (handItem.item == "minecraft:stick" && isSet == false) {
            firstX = curX;
            firstY = curY;
            firstZ = curZ;
            isSet = true;
            BroadcastEventData.data.message = `Registered with coordinates ${firstX} ${firstY} ${firstZ} as the origin`;
            this.broadcastEvent("minecraft:display_chat_event", BroadcastEventData);
        } else if (handItem.item == "minecraft:stick") {      

            let area = (Math.abs(curX-firstX) + 1) * (Math.abs(curY-firstY) + 1) * (Math.abs(curY-firstY) + 1)

            if (firstItemSlot.count >= area) {
                let ExecuteEventData = this.createEventData("minecraft:execute_command");
                ExecuteEventData.data.command = 
                `/fill ${firstX} ${firstY} ${firstZ} ${curX} ${curY} ${curZ} ${firstItemSlot.item.slice( 10 )}`;
                this.broadcastEvent("minecraft:execute_command", ExecuteEventData);

                let player = eventData.data.player;
                let player_nameable = this.getComponent(player, "minecraft:nameable");
                let player_name = player_nameable.data.name;

                ExecuteEventData.data.command = 
                `/clear ${player_name} ${firstItemSlot.item.slice( 10 )} 0 ${area}`;
                this.broadcastEvent("minecraft:execute_command", ExecuteEventData);

                BroadcastEventData.data.message = "Placed!";
                this.broadcastEvent("minecraft:display_chat_event", BroadcastEventData);

                isSet = false;
            }else {
                BroadcastEventData.data.message = `Do not have enough items! ${area}`;
                this.broadcastEvent("minecraft:display_chat_event", BroadcastEventData);
            }
            
        } else {
            isSet = false;
        }
    }
};