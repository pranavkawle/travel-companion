import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let msg = 'An unexpected error occurred';
      if (error.error?.detail) msg = error.error.detail;
      else if (error.error?.title) msg = error.error.title;
      else if (error.status === 401) msg = 'Please log in';
      else if (error.status === 403) msg = 'You do not have permission';
      else if (error.status === 404) msg = 'Not found';
      else if (error.status === 429) msg = 'Too many requests. Please slow down.';

      if (error.status !== 401) {
        messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 });
      }

      return throwError(() => error);
    })
  );
};
