exports.html = `
    <html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Segoe UI, Arial, Helvetica, sans-serif;
            color: #000!important;
        }

        div {
            color: #000!important;
        }

        /* The Modal (background) */
        .modal {
            display: block; /* Hidden by default */
            position: fixed; /* Stay in place */
            z-index: 9998; /* Sit on top */
            padding-top: 250px; /* Location of the box */
            left: 0;
            top: 0;
            width: 100%; /* Full width */
            height: 100%; /* Full height */
            overflow: auto; /* Enable scroll if needed */
            background-color: rgb(0,0,0); /* Fallback color */
            background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
        }

        /* Modal Content */
        .modal-content {
            background-color: #fefefe;
            margin: auto;
            padding: 50px 20px;
            border: 1px solid #888;
            width: 80%;
            position: relative;
            max-width: 427px;
            border-radius: 4px;
            z-index: 9999;
        }

        /* The Close Button */
        .close {
            color: #aaaaaa;
            font-size: 28px;
            font-weight: bold;
        }

        .close:hover,
        .close:focus {
            color: #000;
            text-decoration: none;
            cursor: pointer;
        }
    </style>
</head>
<body>

<!-- The Modal -->
<div id="myModal" class="modal">

    <!-- Modal content -->
    <div class="modal-content">
        <div style="position: absolute; left: calc(50% - 25px); top: -27px;">
            <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="27.5" cy="27.5" r="26.5" fill="#FFEF0D" stroke="white" stroke-width="2"/>
                <path d="M26.4079 29.0933L25.9962 22.9518C25.9194 21.7557 25.8823 20.8962 25.8823 20.3748C25.8823 19.6644 26.0676 19.1119 26.439 18.7132C26.8117 18.3168 27.3017 18.1177 27.9092 18.1177C28.6423 18.1177 29.1346 18.3728 29.3809 18.8799C29.6296 19.3902 29.7556 20.1228 29.7556 21.08C29.7556 21.6427 29.725 22.216 29.6639 22.7972L29.1128 29.1178C29.0531 29.8708 28.9257 30.4478 28.7298 30.8493C28.5326 31.2526 28.2075 31.4518 27.7532 31.4518C27.2938 31.4518 26.9706 31.2577 26.7937 30.8697C26.6117 30.4802 26.4843 29.8879 26.4079 29.0933ZM27.8305 37.5293C27.3096 37.5293 26.8553 37.3617 26.4658 37.0231C26.0764 36.686 25.8823 36.2137 25.8823 35.607C25.8823 35.0777 26.0676 34.6253 26.439 34.2544C26.8117 33.8811 27.266 33.6959 27.8055 33.6959C28.345 33.6959 28.8025 33.8811 29.1841 34.2544C29.5615 34.6253 29.7556 35.0777 29.7556 35.607C29.7556 36.2044 29.5615 36.6758 29.1786 37.0167C28.8104 37.3522 28.3286 37.5354 27.8305 37.5293Z" fill="#1F2E35"/>
            </svg>
        </div>
        <div>
            <div>Bạn không có quyền truy cập gian hàng, vui lòng
                liên hệ chủ cửa hàng để được cấp quyền truy cập.</div>
        </div>
    </div>

</div>
</body>
</html>
    `