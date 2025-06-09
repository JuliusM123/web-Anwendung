import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeleftComponent } from './timeleft';

describe('TimeleftComponent', () => {
    let component: TimeleftComponent;
    let fixture: ComponentFixture<TimeleftComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TimeleftComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeleftComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
