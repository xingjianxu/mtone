# Component coverage

Reference groups 01–09, 11–12 are implemented. Group10 block editor was explicitly postponed.

| Reference group | Exports                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| Buttons         | Button (including iconOnly), ButtonGroup                                          |
| Forms           | Input, Input.Search, Input.TextArea, Form, Form.Item                                      |
| Selection       | Checkbox, RadioGroup (including segmented), Switch, Select, MultiSelect, Slider, NumberInput, DatePicker |
| Navigation      | Sidebar, NavItem, NavGroup, Tree, Breadcrumb                                       |
| Tabs/filter     | Tabs, FilterBar, FilterChip, Pagination                                 |
| Menus           | Menu, ContextMenu, Popover, Tooltip                                        |
| Documents       | List, ListItem, DocumentList, DocumentCard, Card, Text, Divider                    |
| Table           | Table                                                                              |
| Status          | Tag, Status, Avatar, AvatarGroup, Progress, PropertyList, PropertyItem      |
| Dialogs         | Dialog, ConfirmDialog, Drawer                                                       |
| Feedback        | Alert, ToastProvider, useToast, Empty, Skeleton, Spinner, Upload    |

The simple implementation boundaries in API.md are intentional. DatePicker is native, not a custom themed calendar. Upload requires a host adapter. Reference menu shortcuts are display-only, not global registrations. No full form-state engine, dark theme or editor.
