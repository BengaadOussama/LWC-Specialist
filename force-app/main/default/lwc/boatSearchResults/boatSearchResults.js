import { LightningElement,api, wire, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { publish, MessageContext } from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  @track draftValues=[];
  selectedBoatId;
  columns = [
    { label: 'Name', fieldName: 'name', editable : true},
    { label: 'Length', fieldName: 'length__c', editable : true },
    { label: 'Price', fieldName: 'price__c', editable : true},
    { label: 'Description', fieldName: 'description__c', editable : true}
  ];
  boatTypeId = '';
  isLoading = true;
  @track boats=[];

  @wire(MessageContext)
  messageContext;

  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result){
    if(result.data){
      this.boats = result.data.map(boat => {
        return{
          id : boat.Id,
          name : boat.Name,
          description__c : boat.Description__c,
          latitude : boat.Geolocation__Latitude__s,
          longitude : boat.Geolocation__Longitude__s,
          picture : boat.Picture__c,
          owner : boat.Contact__r.Name,
          price__c : boat.Price__c,
          length__c : boat.Length__c,
          boatTypeId : boat.BoatType__c,
          boatType : boat.BoatType__r.Name
        }
      });
    }
    this.isLoading=false;
    this.notifyLoading(this.isLoading);
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
      this.isLoading = true;
      this.notifyLoading(this.isLoading);
      this.boatTypeId = boatTypeId;
  }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);      
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);        
  }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) { 
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    const payload = { recordId: boatId };
    publish(this.messageContext, BoatMC, payload);
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(msg => {
      this.dispatchEvent(
        new ShowToastEvent({
          title: SUCCESS_TITLE,
          message: MESSAGE_SHIP_IT,
          variant: SUCCESS_VARIANT
        })
      )
      refreshApex(this.boats);
    })
    .catch(error => {
      this.dispatchEvent(
        new ShowToastEvent({
          title: ERROR_TITLE,
          message: error.body.message,
          variant: ERROR_VARIANT
        })
      )
    })
    .finally(() => {
      this.draftValues = [];
      this.notifyLoading(false);
    });
  }
    
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
      if (isLoading) {
          this.dispatchEvent(new CustomEvent('loading'));
      } else {
          this.dispatchEvent(new CustomEvent('doneloading'));
      }
  }
}