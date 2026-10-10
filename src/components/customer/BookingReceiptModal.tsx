'use client';

import React from 'react';
import { X, Printer, ShieldCheck, MapPin, Calendar, Clock, CheckCircle2, QrCode } from 'lucide-react';
import { formatIQD, APP_CONFIG } from '@/lib/constants';

interface BookingReceiptModalProps {
  booking: any;
  onClose: () => void;
}

export default function BookingReceiptModal({ booking, onClose }: BookingReceiptModalProps) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusText =
    booking.status === 'CONFIRMED'
      ? 'مؤكد ومقبول 🎉'
      : booking.status === 'PENDING'
      ? 'بانتظار موافقة المالك ⏳'
      : booking.status;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Printable Area */}
        <div id="printable-receipt" className="p-6 space-y-5 bg-white">
          {/* Receipt Header */}
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                ح
              </div>
              <div>
                <h2 className="font-extrabold text-base text-gray-900 leading-tight">{APP_CONFIG.appName}</h2>
                <span className="text-[10px] font-bold text-gray-400 block">وصل حجز إلكتروني معتمد</span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-gray-400 block">رقم الوصل المرجعي</span>
              <span className="text-xs font-extrabold text-brand-700 font-mono">{booking.bookingNumber}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl text-center space-y-0.5">
            <span className="text-[10px] text-emerald-700 font-bold block">حالة الحجز الحالية</span>
            <span className="text-sm font-extrabold text-emerald-900 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {statusText}
            </span>
          </div>

          {/* Listing & Customer Info */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-2xl text-xs">
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="font-bold text-gray-500">اسم المكان / العرض:</span>
              <span className="font-extrabold text-gray-900">{booking.listing?.title || 'مكان مخصص'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="font-bold text-gray-500">المدينة والمنطقة:</span>
              <span className="font-extrabold text-gray-900">البصرة {booking.listing?.district ? `(${booking.listing.district})` : ''}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="font-bold text-gray-500">اسم الزبون:</span>
              <span className="font-extrabold text-gray-900">{booking.customer?.name || 'زبون محترم'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-500">تاريخ الحجز:</span>
              <span className="font-extrabold text-brand-700">{booking.bookingDate}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-gray-500">الشفت / الوقت:</span>
              <span className="font-extrabold text-gray-900">{booking.shiftName || `${booking.startTime} - ${booking.endTime}`}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-brand-50/70 border border-brand-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-brand-700 block">المبلغ الإجمالي المطلق</span>
              <span className="text-xs text-gray-500 font-semibold">بالدينار العراقي (IQD)</span>
            </div>
            <span className="text-xl font-extrabold text-brand-900">{formatIQD(booking.totalPrice)}</span>
          </div>

          {/* QR Verification Block */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                رمز التوثيق الإلكتروني
              </span>
              <p className="text-[10px] text-gray-400 font-medium">قدم هذا الوصل لصاحب المكان عند الوصول.</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
              <QrCode className="w-8 h-8 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-gray-50 p-4 flex items-center justify-between border-t border-gray-100 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 transition"
          >
            إغلاق الوصل
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-extrabold shadow-sm hover:bg-brand-700 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            طباعة / حفظ الوصل
          </button>
        </div>
      </div>
    </div>
  );
}
