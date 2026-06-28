from django.shortcuts import render

def showInfo(request):
    return render(request, 'portfolios/showInfo.html')

def dark_template1_preview(request):
    return render(request, 'portfolios/dark_template1.html')

def dark_template2_preview(request):
    return render(request, 'portfolios/dark_template2.html')

def light_template1_preview(request):
    return render(request, 'portfolios/light_template1.html')

def light_template2_preview(request):
    return render(request, 'portfolios/light_template2.html')

def step_one(request):
    return render(request, 'portfolios/step_one.html')

def step_two(request):
    return render(request, 'user_info/step_two.html')
