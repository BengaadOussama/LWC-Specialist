// imports
import {LightningElement, api, wire, track} from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import { NavigationMixin } from 'lightning/navigation';   

export default class SimilarBoats extends NavigationMixin(LightningElement) {
    // Private
    currentBoat;
    @track relatedBoats;
    boatId;
    error;
    @api similarBy;

    // public

    @api
    get recordId() {
        // returns the boatId
        return this.boatId;
      }
    set recordId(value) {
          // sets the boatId value
          this.boatId = value;
          // sets the boatId attribute
    }
    
    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
    similarBoats({ error, data }) {
      if (data) {
        this.relatedBoats = data.map(boat => {
          return{
            id : boat.Id,
            name : boat.Name,
            description__c : boat.Description__c,
            picture : boat.Picture__c,
            owner : boat.Contact__r.Name,
            price__c : boat.Price__c,
            length__c : boat.Length__c,
            boatTypeId : boat.BoatType__c,
            boatType : boat.BoatType__r.Name
          }
        });
          this.error = undefined;
      } else if (error) {
          this.error = error;
          this.relatedBoats = undefined;
      }
  }

    get getTitle() {
      return 'Similar boats by ' + this.similarBy;
    }
    get noBoats() {
      return !(this.relatedBoats && this.relatedBoats.length > 0);
    }
    
    // Navigate to record page
    openBoatDetailPage(event) {
      this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: event.detail.boatId,
            actionName: 'view'
        }
      });
    }
  }
  