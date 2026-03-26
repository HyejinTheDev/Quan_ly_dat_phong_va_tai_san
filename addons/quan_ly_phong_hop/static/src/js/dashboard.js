odoo.define('quan_ly_phong_hop.Dashboard', function (require) {
    "use strict";

    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var rpc = require('web.rpc');

    var Dashboard = AbstractAction.extend({
        template: 'dashboard_template',
        xmlDependencies: ['/quan_ly_phong_hop/static/src/xml/dashboard.xml'],

        events: {
            'click .dashboard_card_nv': '_onClickNhanVien',
            'click .dashboard_card_ts': '_onClickTaiSan',
            'click .dashboard_card_ph': '_onClickPhongHop',
            'click .dashboard_card_dp': '_onClickDatPhong',
        },

        start: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                self._loadCount('nhan_vien', '.dashboard_nhan_vien_count');
                self._loadCount('tai_san', '.dashboard_tai_san_count');
                self._loadCount('phong_hop', '.dashboard_phong_hop_count');
                self._loadDatPhongHomNay();
                self._loadTaiSanStatus();
                self._loadPhongHopStatus();
                self._loadMuonGanDay();
                self._loadSuCoGanDay();
            });
        },

        _loadCount: function (model, selector) {
            var self = this;
            rpc.query({
                model: model,
                method: 'search_count',
                args: [[]],
            }).then(function (count) {
                self.$(selector).text(count);
            }).guardedCatch(function () {
                self.$(selector).text('-');
            });
        },

        _loadDatPhongHomNay: function () {
            var self = this;
            var today = new Date().toISOString().split('T')[0];
            rpc.query({
                model: 'dat_phong',
                method: 'search_count',
                args: [[['thoi_gian_bat_dau', '>=', today + ' 00:00:00'],
                        ['thoi_gian_bat_dau', '<=', today + ' 23:59:59'],
                        ['trang_thai', 'not in', ['huy']]]],
            }).then(function (count) {
                self.$('.dashboard_dat_phong_count').text(count);
            }).guardedCatch(function () {
                self.$('.dashboard_dat_phong_count').text('-');
            });
        },

        _renderStatusBars: function (result, statusMap) {
            var total = 0;
            result.forEach(function (item) { total += item.trang_thai_count; });
            var html = '';
            result.forEach(function (item) {
                var s = statusMap[item.trang_thai] || {label: item.trang_thai, color: '#999', icon: 'fa-circle'};
                var pct = total > 0 ? Math.round(item.trang_thai_count / total * 100) : 0;
                html += '<div style="display:flex;align-items:center;margin-bottom:10px;padding:10px;background:#f8f9fa;border-radius:8px;">' +
                    '<i class="fa ' + s.icon + '" style="color:' + s.color + ';font-size:20px;margin-right:12px;"></i>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong>' + s.label + '</strong><span>' + item.trang_thai_count + '</span></div>' +
                    '<div style="background:#e9ecef;border-radius:4px;height:6px;"><div style="background:' + s.color + ';border-radius:4px;height:6px;width:' + pct + '%;"></div></div>' +
                    '</div></div>';
            });
            return html;
        },

        _loadTaiSanStatus: function () {
            var self = this;
            rpc.query({
                model: 'tai_san',
                method: 'read_group',
                kwargs: { domain: [], fields: ['trang_thai'], groupby: ['trang_thai'] },
            }).then(function (result) {
                var map = {
                    'san_sang': {label: 'Sẵn sàng', color: '#28a745', icon: 'fa-check-circle'},
                    'dang_muon': {label: 'Đang mượn', color: '#17a2b8', icon: 'fa-exchange'},
                    'bao_tri': {label: 'Bảo trì', color: '#ffc107', icon: 'fa-wrench'},
                    'hong': {label: 'Hỏng', color: '#dc3545', icon: 'fa-times-circle'},
                    'mat': {label: 'Mất', color: '#6c757d', icon: 'fa-ban'},
                };
                self.$('.dashboard_tai_san_status').html(self._renderStatusBars(result, map) || '<p class="text-muted">Chưa có dữ liệu</p>');
            }).guardedCatch(function () {
                self.$('.dashboard_tai_san_status').html('<p class="text-muted">Không tải được dữ liệu</p>');
            });
        },

        _loadPhongHopStatus: function () {
            var self = this;
            rpc.query({
                model: 'phong_hop',
                method: 'read_group',
                kwargs: { domain: [], fields: ['trang_thai'], groupby: ['trang_thai'] },
            }).then(function (result) {
                var map = {
                    'san_sang': {label: 'Sẵn sàng', color: '#28a745', icon: 'fa-check-circle'},
                    'dang_su_dung': {label: 'Đang sử dụng', color: '#ffc107', icon: 'fa-clock-o'},
                    'bao_tri': {label: 'Bảo trì', color: '#dc3545', icon: 'fa-wrench'},
                };
                self.$('.dashboard_phong_hop_status').html(self._renderStatusBars(result, map) || '<p class="text-muted">Chưa có dữ liệu</p>');
            }).guardedCatch(function () {
                self.$('.dashboard_phong_hop_status').html('<p class="text-muted">Không tải được dữ liệu</p>');
            });
        },

        _loadMuonGanDay: function () {
            var self = this;
            rpc.query({
                model: 'muon_tai_san',
                method: 'search_read',
                kwargs: {
                    domain: [['trang_thai', 'not in', ['huy']]],
                    fields: ['tai_san_id', 'nhan_vien_id', 'ngay_muon', 'trang_thai'],
                    limit: 5, order: 'ngay_muon desc',
                },
            }).then(function (result) {
                if (!result.length) {
                    self.$('.dashboard_muon_tai_san').html('<p class="text-muted">Chưa có yêu cầu mượn</p>');
                    return;
                }
                var badges = {
                    'yeu_cau': '#6c757d', 'da_duyet': '#17a2b8',
                    'dang_muon': '#ffc107', 'da_tra': '#28a745',
                };
                var labels = {
                    'yeu_cau': 'Yêu cầu', 'da_duyet': 'Đã duyệt',
                    'dang_muon': 'Đang mượn', 'da_tra': 'Đã trả',
                };
                var html = '<table class="table table-sm" style="margin:0;"><tbody>';
                result.forEach(function (r) {
                    var color = badges[r.trang_thai] || '#999';
                    var label = labels[r.trang_thai] || r.trang_thai;
                    html += '<tr><td><i class="fa fa-laptop text-muted"/> ' + (r.tai_san_id ? r.tai_san_id[1] : '') + '</td>' +
                        '<td><i class="fa fa-user text-muted"/> ' + (r.nhan_vien_id ? r.nhan_vien_id[1] : '') + '</td>' +
                        '<td><span style="background:' + color + ';color:white;padding:2px 8px;border-radius:12px;font-size:11px;">' + label + '</span></td></tr>';
                });
                html += '</tbody></table>';
                self.$('.dashboard_muon_tai_san').html(html);
            }).guardedCatch(function () {
                self.$('.dashboard_muon_tai_san').html('<p class="text-muted">Không tải được dữ liệu</p>');
            });
        },

        _loadSuCoGanDay: function () {
            var self = this;
            rpc.query({
                model: 'su_co_tai_san',
                method: 'search_read',
                kwargs: {
                    domain: [],
                    fields: ['tai_san_id', 'loai_su_co', 'ngay_bao_cao', 'trang_thai'],
                    limit: 5, order: 'ngay_bao_cao desc',
                },
            }).then(function (result) {
                if (!result.length) {
                    self.$('.dashboard_su_co').html('<p class="text-muted">Không có sự cố 🎉</p>');
                    return;
                }
                var html = '<table class="table table-sm" style="margin:0;"><tbody>';
                result.forEach(function (r) {
                    var icon = r.loai_su_co === 'mat' ? '<i class="fa fa-ban text-danger"/>' : '<i class="fa fa-exclamation-triangle text-warning"/>';
                    var loai = r.loai_su_co === 'mat' ? 'Mất' : 'Hỏng';
                    html += '<tr><td>' + icon + ' ' + (r.tai_san_id ? r.tai_san_id[1] : '') + '</td><td>' + loai + '</td><td>' + (r.ngay_bao_cao || '') + '</td></tr>';
                });
                html += '</tbody></table>';
                self.$('.dashboard_su_co').html(html);
            }).guardedCatch(function () {
                self.$('.dashboard_su_co').html('<p class="text-muted">Không tải được dữ liệu</p>');
            });
        },

        // Click handlers - navigate to list views
        _onClickNhanVien: function () {
            this.do_action({ type: 'ir.actions.act_window', name: 'Nhân viên', res_model: 'nhan_vien', view_mode: 'kanban,tree,form', views: [[false, 'kanban'], [false, 'tree'], [false, 'form']] });
        },
        _onClickTaiSan: function () {
            this.do_action({ type: 'ir.actions.act_window', name: 'Tài sản', res_model: 'tai_san', view_mode: 'kanban,tree,form', views: [[false, 'kanban'], [false, 'tree'], [false, 'form']] });
        },
        _onClickPhongHop: function () {
            this.do_action({ type: 'ir.actions.act_window', name: 'Phòng họp', res_model: 'phong_hop', view_mode: 'kanban,tree,form', views: [[false, 'kanban'], [false, 'tree'], [false, 'form']] });
        },
        _onClickDatPhong: function () {
            this.do_action({ type: 'ir.actions.act_window', name: 'Đặt phòng', res_model: 'dat_phong', view_mode: 'kanban,tree,form,calendar', views: [[false, 'kanban'], [false, 'tree'], [false, 'form'], [false, 'calendar']] });
        },
    });

    core.action_registry.add('dashboard_tong_quan', Dashboard);
    return Dashboard;
});
