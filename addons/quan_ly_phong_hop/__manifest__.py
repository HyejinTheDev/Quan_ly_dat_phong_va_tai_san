# -*- coding: utf-8 -*-
{
    'name': "Quản lý Phòng họp",

    'summary': "Đặt phòng họp thông minh, kiểm tra thiết bị và gợi ý phòng bằng AI",

    'description': """
        Module quản lý phòng họp bao gồm:
        - Quản lý thông tin phòng họp (sức chứa, thiết bị, vị trí)
        - Đặt phòng với kiểm tra xung đột lịch
        - Tối ưu sức chứa (cảnh báo phòng quá lớn/nhỏ)
        - AI gợi ý phòng: nhập yêu cầu bằng ngôn ngữ tự nhiên
        - Kiểm tra phòng sau khi trả (thiết bị thiếu/hỏng)
        - Xử lý sự cố: đổi phòng hoặc gọi sửa chữa
        - Dashboard tổng quan hệ thống
    """,

    'author': "BTL Nhóm",
    'website': "",
    'category': 'Administration',
    'version': '15.0.1.0.0',

    'depends': ['base', 'nhan_su', 'quan_ly_tai_san'],

    'data': [
        'security/ir.model.access.csv',
        'wizard/goi_y_phong_view.xml',
        'views/phong_hop.xml',
        'views/phong_hop_kanban.xml',
        'views/dat_phong.xml',
        'views/dat_phong_kanban.xml',
        'views/kiem_tra_phong.xml',
        'views/su_co_phong.xml',
        'views/su_co_phong_kanban.xml',
        'views/nhan_vien_inherit.xml',
        'views/dashboard.xml',
        'views/menu.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'quan_ly_phong_hop/static/src/js/dashboard.js',
        ],
        'web.assets_qweb': [
            'quan_ly_phong_hop/static/src/xml/dashboard.xml',
        ],
    },
    'demo': [],
    'installable': True,
    'application': True,
}
