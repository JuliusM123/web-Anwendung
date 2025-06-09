import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnlegenComponent } from './anlegen';

describe('AnlegenComponent', () => {
    let component: AnlegenComponent;
    let fixture: ComponentFixture<AnlegenComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnlegenComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AnlegenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
