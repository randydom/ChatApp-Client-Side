import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupsService} from '../../Services/groups/groups.service';
import {AllGroups} from '../../models/model';
import {Subscription} from 'rxjs';
import {animate, group, style, transition, trigger} from '@angular/animations';
import {SocketService} from '../../Services/socket-io/socket.service';
import Swal from 'sweetalert2';
import Uikit from 'uikit';

@Component({
    selector: 'app-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss'],
    animations: [
        trigger('scaleIn', [
            transition('void => *', [
                style({
                    opacity: 0,
                    transform: 'translateX(-50%)'
                }), group([
                    animate(250, style({
                        opacity: 1
                    })), animate(250, style({
                        transform: 'translateX(0)'
                    }))
                ])
            ])
        ]),
        trigger('scaleUp', [
            transition('void => *', [
                style({
                    opacity: 0,
                    transform: 'translateY(-50%)'
                }), group([
                    animate(250, style({
                        opacity: 1
                    })), animate(250, style({
                        transform: 'translateY(0)'
                    }))
                ])
            ])
        ])
    ]
})
export class GroupsComponent implements OnInit, OnDestroy {
    // variable
    sendRequest = false;
    allGroupsSub: Subscription;
    groupName;
    emptyAlert = false;
    // arraies
    allGroupsContainer: AllGroups[] = [];
    // sweet alert
    Toast = Swal.mixin({
        toast: true,
        position: 'top-left',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    constructor(private groupService: GroupsService, public socket: SocketService) {
    }

    ngOnInit(): void {
        this.getGroups();
    }

    ngOnDestroy(): void {
        this.allGroupsSub.unsubscribe();
    }

    addGroup(form): void {
        this.sendRequest = true;
        this.groupService.createGroup({groupName: this.groupName}).subscribe(res => {
            this.sendRequest = false;
            this.closeMe();
            this.alertSuccess('Group created successfully');
            this.getGroups();
            form.reset();
        }, err => {
            this.sendRequest = false;
            this.alertDanger('Something went wrong');
        });
    }

    deleteGroup(id, groupName): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Would you like to delete ${groupName} !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                this.groupService.deleteGroup(id).subscribe(res => {
                    this.getGroups();
                    Swal.fire(
                        'Deleted!',
                        `${groupName} has been deleted.`,
                        'success'
                    );
                });
            }
        });

    }

    leaveGroup(id, groupName): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Would you like to leave ${groupName} ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, leave it!'
        }).then((result) => {
            if (result.value) {
                this.groupService.leaveGroup(id).subscribe(res => {
                    this.getGroups();
                    Swal.fire(
                        'Deleted!',
                        `${res.message}`,
                        'success'
                    );
                });
            }
        });
    }

    getGroups(): void {
        this.socket.showLoader();
        this.allGroupsSub = this.groupService.getAllGroups().subscribe(res => {
            this.allGroupsContainer = res.userGroups;
            if (res.userGroups.length === 0) {
                this.emptyAlert = true;
            } else {
                this.emptyAlert = false;
            }
            this.socket.hideLoader();
            console.log(res);
        });
    }


    alertSuccess(message: string): void {
        this.Toast.fire({
            icon: 'success',
            title: message
        });
    }

    alertDanger(message: string): void {
        this.Toast.fire({
            icon: 'error',
            title: message
        });
    }

    closeMe(): void {
        Uikit.modal('#add-group').hide();
    }
}
