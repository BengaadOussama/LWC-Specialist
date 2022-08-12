import { api, LightningElement } from 'lwc';
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    
    //@api boat = {Id:'id', name:'Test', owner:'Oussama', price:'1341.234', length:'4 m', type:'Type1', image:'/resource/Houseboats/partyboat1.png'};
    @api boat;
    @api selectedBoatId;
    
    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() { 
        return 'background-image:url('+this.boat.picture+')';
    }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() { 
        if(this.boat.id==this.selectedBoatId){
            return TILE_WRAPPER_SELECTED_CLASS;
        }else{
            return TILE_WRAPPER_UNSELECTED_CLASS;
        }
    }
    
    // Fires event with the Id of the boat that has been selected.
    selectBoat() { 
        this.selectedBoatId = this.boat.Id;
        const boatselect = new CustomEvent('boatselect',{detail :  { boatId: this.boat.id}});
        this.dispatchEvent(boatselect);
    }
}