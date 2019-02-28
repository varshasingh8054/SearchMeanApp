import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-addtask',
  templateUrl: './addtask.component.html',
  styleUrls: ['./addtask.component.css']
})
export class AddtaskComponent implements OnInit {
  taskId: String;
  taskName: String;
  taskDesc: String;
  taskHandler: String;
  taskClientName : String;

  constructor(
    
   private authService: AuthService,
   private router: Router,
    private flashMessage: FlashMessagesService
    ) { }

  ngOnInit() {
    
  }

  onaddtaskSubmit() {
    const task = {
      taskId: this.taskId,
  taskName: this.taskName,
  taskDesc: this.taskDesc,
  taskHandler: this.taskHandler,
  taskClientName : this.taskClientName
    }

   this.authService.addtask(task).subscribe(data => {
      if(data.success) {
        console.log("success");
        this.flashMessage.show('Added Task', {cssClass: 'alert-success', timeout: 3000});
        this.router.navigate(['/showtask']);
      } else {
 
        this.flashMessage.show('already exists', {cssClass: 'alert-danger', timeout: 3000});
       
        this.router.navigate(['/addtask']);
     
      }
    });
    }
  }
